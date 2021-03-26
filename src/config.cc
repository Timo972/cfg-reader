#include "config.h"
#include "convert.h"

#ifdef DEBUG
#include <iostream>
#endif

void Config::Init(v8::Local<v8::Object> exports)
{
    v8::Isolate *isolate = exports->GetIsolate();
    v8::Local<v8::Context> context = isolate->GetCurrentContext();

    v8::Local<v8::ObjectTemplate> addon_data_tpl = v8::ObjectTemplate::New(isolate);
    addon_data_tpl->SetInternalFieldCount(1);
    v8::Local<v8::Object> addon_data = addon_data_tpl->NewInstance(context).ToLocalChecked();

    v8::Local<v8::FunctionTemplate> tpl = v8::FunctionTemplate::New(isolate, New, addon_data);
    tpl->SetClassName(v8::String::NewFromUtf8(isolate, "Config"));
    tpl->InstanceTemplate()->SetInternalFieldCount(1);

    NODE_SET_PROTOTYPE_METHOD(tpl, "Get", Get);

    v8::Local<v8::Function> constructor = tpl->GetFunction(context).ToLocalChecked();
    addon_data->SetInternalField(0, constructor);

    exports->Set(context, v8::String::NewFromUtf8(isolate, "Config"), constructor).FromJust();
};

void Config::New(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    v8::Isolate *isolate = args.GetIsolate();
    v8::Local<v8::Context> context = isolate->GetCurrentContext();

    if (args.IsConstructCall())
    {
        if (!args[0]->IsString() || args.Length() != 1)
        {
            isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8(isolate, "Invalid params passed")));
            return;
        }

        v8::Local<v8::String> fileName = args[0]->ToString(isolate);
    }
}

Config::Config(const Napi::CallbackInfo &info) : Napi::ObjectWrap<Config>(info)
{
    Napi::Env env = info.Env();

    if (info.Length() > 2 || info.Length() < 1)
    {
        Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
        return;
    }

    if (!info[0].IsString())
    {
        Napi::TypeError::New(env, "Wrong arguments").ThrowAsJavaScriptException();
        return;
    }

    if (info.Length() > 1 && !info[1].IsBoolean())
    {
        Napi::TypeError::New(env, "Wrong arguments").ThrowAsJavaScriptException();
        //return Napi::Boolean::New(env, false);
        return;
    }

    auto fileName = info[0].As<Napi::String>().Utf8Value();
    auto wFileName = to_wstring(fileName);

    bool createFileIfNotExist = false;

    if (info.Length() > 1 && info[1].IsBoolean())
        createFileIfNotExist = info[1].As<Napi::Boolean>().Value();

    this->_name = wFileName;

    auto node = altWrapper::Load(wFileName);

    if (node == false && createFileIfNotExist != true)
    {
        Napi::TypeError::New(env, "File does not exist").ThrowAsJavaScriptException();
        return;
    }

    //if(node == false) {
    //    return;
    //}

    this->_node = node;
};

Napi::Value Config::GetValueOfType(Napi::Env env, int type, alt::config::Node value)
{
    if (type == 0 && !value.IsDict() && !value.IsList())
    {
        auto boolean = value.ToBool();
        return Napi::Boolean::New(env, boolean);
    }
    else if (type == 1 && !value.IsDict() && !value.IsList())
    {
        auto number = value.ToNumber();
        return Napi::Number::New(env, number);
    }
    else if (type == 2 && !value.IsDict() && !value.IsList())
    {
        auto string = value.ToString();
        return Napi::String::New(env, string);
    }
    else if (type == 4 && value.IsDict() && !value.IsList())
    {
#ifdef DEBUG
        std::cout << "Config::GetValueOfType is now parsing a dict\n";
#endif
        auto dict = value.ToDict();
        Napi::Object jsDict = Napi::Object::New(env);

        for (alt::config::Node::Dict::iterator node = dict.begin(); node != dict.end(); ++node)
        {
            auto first = node->first;
            auto second = node->second;

            try
            {
#ifdef DEBUG
                std::cout << "Config::GetValueOfType parse dict key value: " << second.ToString() << "\n";
#endif
                auto jsVal = GetValueUnknownType(env, second);

                jsDict.Set(first, jsVal);
            }
            catch (...)
            {
                const std::string errorMsg = std::string("Unsupported value in dict for key: " + first);
                Napi::TypeError::New(env, errorMsg).ThrowAsJavaScriptException();
            }
        }

        return jsDict;
    }
    else if (type == 3 && !value.IsDict() && value.IsList())
    {
        auto list = value.ToList();
        Napi::Array jsList = Napi::Array::New(env);

#ifdef DEBUG
        std::cout << "Config::GetValueOfType is now parsing a list \n";
#endif

        for (alt::config::Node::List::iterator node = list.begin(); node != list.end(); ++node)
        {
#ifdef DEBUG
            std::cout << "Config::GetValueOfType list parsing got to index " << jsList.Length() << "\n";
#endif
            try
            {
                auto val = GetValueUnknownType(env, *node);
                jsList.Set(jsList.Length(), val);
            }
            catch (...)
            {
#ifdef DEBUG
                std::cout << "Config::GetValueOfType could not parse list item type at index: " << jsList.Length() << "\n";
#endif
                //const std::string errorMsg = std::string("Unsupported value in list at index: " + std::to_string(jsList.Length()));
                //Napi::TypeError::New(env, errorMsg).ThrowAsJavaScriptException();
            }
        }

        return jsList;
    }
    else
    {
        Napi::TypeError::New(env, "Invalid type passed at Config::GetValueOfType").ThrowAsJavaScriptException();
        return env.Null();
    }
}

Napi::Value Config::GetValueUnknownType(Napi::Env env, alt::config::Node value)
{

    if (value.IsDict())
    {
#ifdef DEBUG
        std::cout << "Config::GetValueUnknownType recieved dict to parse\n";
#endif
        return GetValueOfType(env, 4, value);
    }
    else if (value.IsList())
    {

        return GetValueOfType(env, 3, value);
    }

    for (int i = 0; i < 5; i++)
    {
#ifdef DEBUG
        std::cout << "Config::GetValueUnknownType trying type " << i << "\n";
#endif
        try
        {
            return GetValueOfType(env, i, value);
        }
        catch (...)
        {
#ifdef DEBUG
            std::cout << "Config::GetValueUnknownType type " << i << " is not right type\n";
#endif
        }
    }

    return env.Null();
}

void Config::Get(const v8::FunctionCallbackInfo<v8::Value> &info)
{
    Napi::Env env = info.Env();

    if (info.Length() != 1)
    {
        Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
        return env.Null();
    }

    if (!info[0].IsString())
    {
        Napi::TypeError::New(env, "Wrong arguments").ThrowAsJavaScriptException();
        return env.Null();
    }

    auto key = info[0].As<Napi::String>().Utf8Value();

    //const char* type = typeid(this->_node).name;
    //const char* nodeType = "Node";

    //if(type != nodeType) {
    //    return env.Null();
    //}

    auto value = this->_node[key];

    if (value.IsNone())
    {
        return env.Null();
    }

    //if (value.IsScalar()) {
    //    Napi::Error::New(env, "Unknown value type: scalar").ThrowAsJavaScriptException();
    //    return env.Null();
    //}

    try
    {
        return GetValueUnknownType(env, value);
    }
    catch (...)
    {
        const std::string errorMsg = std::string("Unsupported value at key: " + key);
        Napi::Error::New(env, errorMsg).ThrowAsJavaScriptException();
        return env.Null();
    }

    return env.Null();
};

Napi::Value Config::Set(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();

    if (info.Length() != 2)
    {
        Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }

    if (!info[0].IsString())
    {
        Napi::TypeError::New(env, "Invalid key type").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }

    if (!info[1].IsNumber() && !info[1].IsBoolean() && !info[1].IsString())
    {
        Napi::TypeError::New(env, "Unsupported value type").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }

    std::string key = info[0].As<Napi::String>().Utf8Value();

    if (info[1].IsNumber())
    {
        double value = info[1].As<Napi::Number>().DoubleValue();
        this->_node[key] = value;
    }
    else if (info[1].IsBoolean())
    {
        bool value = info[1].As<Napi::Boolean>().Value();
        this->_node[key] = value;
    }
    else if (info[1].IsString())
    {
        std::string value = info[1].As<Napi::String>().Utf8Value();
        this->_node[key] = value;
    }
    else
    {
        return Napi::Boolean::New(env, false);
    }

    return Napi::Boolean::New(env, true);
};

Napi::Value Config::GetOfType(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();

    if (info.Length() != 2)
    {
        Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
        return env.Null();
    }

    if (!info[0].IsString())
    {
        Napi::TypeError::New(env, "Wrong arguments").ThrowAsJavaScriptException();
        return env.Null();
    }

    if (!info[1].IsNumber())
    {
        Napi::TypeError::New(env, "Wrong arguments").ThrowAsJavaScriptException();
        return env.Null();
    }

    int type = info[1].As<Napi::Number>().Int32Value();
    std::string key = info[0].As<Napi::String>().Utf8Value();

    auto value = this->_node[key];

    try
    {
        return GetValueOfType(env, type, value);
    }
    catch (...)
    {
        const std::string errorMsg = std::string("Wrong value type: " + std::to_string(type) + " for key: " + key);
        Napi::TypeError::New(env, errorMsg).ThrowAsJavaScriptException();
    }

    return env.Null();
};

Napi::Value Config::Save(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();

    try
    {
        altWrapper::Save(this->_name, this->_node);
    }
    catch (...)
    {
        return Napi::Boolean::New(env, false);
    }

    return Napi::Boolean::New(env, true);
}
