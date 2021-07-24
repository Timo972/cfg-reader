#include "config.h"

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
    tpl->SetClassName(v8::String::NewFromUtf8(isolate, "Config").ToLocalChecked());
    tpl->InstanceTemplate()->SetInternalFieldCount(1);

    NODE_SET_PROTOTYPE_METHOD(tpl, "get", Get);
    NODE_SET_PROTOTYPE_METHOD(tpl, "getOfType", GetOfType);
    NODE_SET_PROTOTYPE_METHOD(tpl, "set", Set);
    NODE_SET_PROTOTYPE_METHOD(tpl, "save", Save);
    NODE_SET_PROTOTYPE_METHOD(tpl, "serialize", Serialize);

    v8::Local<v8::Function> constructor = tpl->GetFunction(context).ToLocalChecked();
    addon_data->SetInternalField(0, constructor);

    exports->Set(context, v8::String::NewFromUtf8(isolate, "Config").ToLocalChecked(), constructor).FromJust();
};

Config::Config(v8::Isolate *isolate, std::string fileName, bool createFileIfNotExist) : _name(fileName)
{
    std::ifstream file(fileName.c_str());
    bool exists = file.good();

    alt::config::Node node;

    if (exists)
    {
        node = helper::Load(file);
    }
    else if (!createFileIfNotExist)
    {
        isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, "File does not exist").ToLocalChecked()));
#ifdef DEBUG
        std::cout << "File does not exist" << std::endl;
#endif
        return;
    }

    this->_node = node;
}

Config::Config(v8::Isolate *isolate, std::string fileName, v8::Local<v8::Object> predefines) : _name(fileName)
{
    std::ifstream file(fileName.c_str());
    bool exists = file.good();

    alt::config::Node node;

    if (exists)
    {
        isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, "File already exist").ToLocalChecked()));
#ifdef DEBUG
        std::cout << "File already exist" << std::endl;
#endif
        return;
    }
    else
    {
        node = alt::config::Node(helper::V8ObjectToDict(isolate, predefines));
    }

    this->_node = node;
}

Config::~Config()
{
}

void Config::New(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    v8::Isolate *isolate = args.GetIsolate();

    if (args.IsConstructCall())
    {
        if (args.Length() > 2 || args.Length() < 1)
        {
            isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8(isolate, "Invalid amount of arguments passed").ToLocalChecked()));
            return;
        }

        if (!args[0]->IsString())
        {
            isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8(isolate, "Invalid argument passed").ToLocalChecked()));
            return;
        }

        if (args.Length() > 1 && (!args[1]->IsObject() && !args[1]->IsBoolean()))
        {
            isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8(isolate, "Invalid argument passed").ToLocalChecked()));
            return;
        }

        v8::Local<v8::String> fileName = args[0]->ToString(isolate->GetCurrentContext()).ToLocalChecked();
        v8::String::Utf8Value const str(isolate, fileName);

        std::string name = std::string(*str, str.length());

        Config *cfg;

        if (args.Length() == 1)
        {
            cfg = new Config(isolate, name);
        }
        else if (args[1]->IsBoolean())
        {
            bool createIfNotExists = args[1]->ToBoolean(isolate)->Value();
            cfg = new Config(isolate, name, createIfNotExists);
        }
        else if (args[1]->IsObject())
        {
            v8::Local<v8::Object> predefines = v8::Local<v8::Object>::Cast(args[1]);
            cfg = new Config(isolate, name, predefines);
        }
        else
        {
            cfg = new Config(isolate, name, v8::Object::New(isolate));
        }

        cfg->Wrap(args.This());
        args.GetReturnValue().Set(args.This());
    }
}

v8::Local<v8::Value> Config::GetValueOfType(v8::Isolate *isolate, ConfigValueType type, alt::config::Node value)
{
    if (type == 0 && !value.IsDict() && !value.IsList())
    {
        auto boolean = value.ToBool();
        return v8::Boolean::New(isolate, boolean);
    }
    else if (type == 1 && !value.IsDict() && !value.IsList())
    {
        auto number = value.ToNumber();
        return v8::Number::New(isolate, number);
    }
    else if (type == 2 && !value.IsDict() && !value.IsList())
    {
        auto string = value.ToString();
#ifdef DEBUG
        std::cout << "Config::GetValueOfType type string: " << string << std::endl;
#endif
        auto v8String = v8::String::NewFromUtf8(isolate, string.c_str()).ToLocalChecked();
        v8::String::Utf8Value const str(isolate, v8String);
#ifdef DEBUG
        std::cout << "Config::GetValueOfType v8 string: " << std::string(*str, str.length()) << std::endl;
#endif
        return v8String;
    }
    else if (type == 4 && value.IsDict() && !value.IsList())
    {
#ifdef DEBUG
        std::cout << "Config::GetValueOfType is now parsing a dict\n";
#endif
        auto dict = value.ToDict();
        auto jsDict = v8::Object::New(isolate);

        for (alt::config::Node::Dict::iterator node = dict.begin(); node != dict.end(); ++node)
        {
            auto first = node->first;
            auto second = node->second;

            try
            {
#ifdef DEBUG
                std::cout << "Config::GetValueOfType parse dict key value: " << second.ToString() << "\n";
#endif
                auto jsVal = GetValueUnknownType(isolate, second);
                jsDict->Set(isolate->GetCurrentContext(), v8::String::NewFromUtf8(isolate, first.c_str()).ToLocalChecked(), jsVal);
            }
            catch (...)
            {
                const std::string errorMsg = std::string("Unsupported value in dict for key: " + first);
                isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, errorMsg.c_str()).ToLocalChecked()));
            }
        }

        return jsDict;
    }
    else if (type == 3 && !value.IsDict() && value.IsList())
    {
        auto list = value.ToList();
        auto jsList = v8::Array::New(isolate);

#ifdef DEBUG
        std::cout << "Config::GetValueOfType is now parsing a list \n";
#endif

        for (alt::config::Node::List::iterator node = list.begin(); node != list.end(); ++node)
        {
#ifdef DEBUG
            std::cout << "Config::GetValueOfType list parsing got to index " << jsList->Length() << "\n";
#endif
            try
            {
                auto val = GetValueUnknownType(isolate, *node);
                jsList->Set(isolate->GetCurrentContext(), jsList->Length(), val);
            }
            catch (...)
            {
#ifdef DEBUG
                std::cout << "Config::GetValueOfType could not parse list item type at index: " << jsList->Length() << "\n";
#endif
                //const std::string errorMsg = std::string("Unsupported value in list at index: " + std::to_string(jsList.Length()));
            }
        }

        return jsList;
    }
    else
    {
        isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, "Invalid type passed at Config::GetValueOfType").ToLocalChecked()));
        return v8::Null(isolate);
    }
}

v8::Local<v8::Value> Config::GetValueUnknownType(v8::Isolate *isolate, alt::config::Node value)
{

    if (value.IsDict())
    {
#ifdef DEBUG
        std::cout << "Config::GetValueUnknownType recieved dict to parse\n";
#endif
        return GetValueOfType(isolate, ConfigValueType::Dict, value);
    }
    else if (value.IsList())
    {

        return GetValueOfType(isolate, ConfigValueType::List, value);
    }

    for (int i = 0; i < 3; i++)
    {
#ifdef DEBUG
        std::cout << "Config::GetValueUnknownType trying type " << i << "\n";
#endif
        try
        {
            return GetValueOfType(isolate, static_cast<ConfigValueType>(i), value);
        }
        catch (...)
        {
#ifdef DEBUG
            std::cout << "Config::GetValueUnknownType type " << i << " is not right type\n";
#endif
        }
    }

    return v8::Null(isolate);
}

void Config::Get(const v8::FunctionCallbackInfo<v8::Value> &info)
{
#ifdef DEBUG
    std::cout << "invoked Config::Get" << std::endl;
#endif
    v8::Isolate *isolate = info.GetIsolate();

    if (info.Length() != 1)
    {
        isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, "Wrong number of arguments").ToLocalChecked()));
        info.GetReturnValue().Set(v8::Null(isolate));
        return;
    }

    if (!info[0]->IsString())
    {
        isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, "Wrong arguments").ToLocalChecked()));
        info.GetReturnValue().Set(v8::Null(isolate));
        return;
    }

#ifdef DEBUG
    std::cout << "Config::Get unwrapping class" << std::endl;
#endif

    Config *cfg = node::ObjectWrap::Unwrap<Config>(info.Holder());

    auto v8Key = info[0]->ToString(isolate->GetCurrentContext());
    v8::String::Utf8Value const str(isolate, v8Key.ToLocalChecked());

    std::string key = std::string(*str, str.length());

    //const char* type = typeid(this->_node).name;
    //const char* nodeType = "Node";

    //if(type != nodeType) {
    //    return env.Null();
    //}

#ifdef DEBUG
    std::cout << "Config::Get getting value from config node: " << key << std::endl;
#endif

    alt::config::Node value;
    try
    {
        value = cfg->_node[key];
    }
    catch (alt::config::Error &e)
    {
        info.GetReturnValue().Set(v8::Null(isolate));
        return;
    }

#ifdef DEBUG
    std::cout << "Config::Get got config node value" << std::endl;
#endif

    if (value.IsNone())
    {
#ifdef DEBUG
        std::cout << "Config::Get value is none" << std::endl;
#endif
        info.GetReturnValue().Set(v8::Null(isolate));
        return;
    }

    try
    {
#ifdef DEBUG
        std::cout << "Config::Get got to point GetValueUnknownType" << std::endl;
#endif
        auto v8Value = GetValueUnknownType(isolate, value);
        info.GetReturnValue().Set(v8Value);
        return;
    }
    catch (...)
    {
        const std::string errorMsg = std::string("Unsupported value at key: " + key);
        isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, errorMsg.c_str()).ToLocalChecked()));
        info.GetReturnValue().Set(v8::Null(isolate));
        return;
    }

    info.GetReturnValue().Set(v8::Null(isolate));
    return;
};

void Config::Set(const v8::FunctionCallbackInfo<v8::Value> &info)
{
    v8::Isolate *isolate = info.GetIsolate();

    if (info.Length() != 2)
    {
        isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, "Wrong number of arguments").ToLocalChecked()));
        info.GetReturnValue().Set(v8::Boolean::New(isolate, false));
        return;
    }

    if (!info[0]->IsString())
    {
        isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, "Invalid key type").ToLocalChecked()));
        info.GetReturnValue().Set(v8::Boolean::New(isolate, false));
        return;
    }

    if (!info[1]->IsNumber() && !info[1]->IsBoolean() && !info[1]->IsString())
    {
        isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, "Unsupported value type").ToLocalChecked()));
        info.GetReturnValue().Set(v8::Boolean::New(isolate, false));
        return;
    }

    auto v8Key = info[0]->ToString(isolate->GetCurrentContext());

    v8::String::Utf8Value const str(isolate, v8Key.ToLocalChecked());
    std::string key = std::string(*str, str.length());

    Config *cfg = node::ObjectWrap::Unwrap<Config>(info.Holder());

    if (info[1]->IsNumber())
    {
        double value = info[1]->ToNumber(isolate->GetCurrentContext()).ToLocalChecked()->Value();
        cfg->_node[key] = value;
    }
    else if (info[1]->IsBoolean())
    {
        bool value = info[1]->ToBoolean(isolate)->Value();
        cfg->_node[key] = value;
    }
    else if (info[1]->IsString())
    {
        v8::String::Utf8Value const str(isolate, info[1]->ToString(isolate->GetCurrentContext()).ToLocalChecked());
        std::string value = std::string(*str, str.length());
        cfg->_node[key] = value;
    }
    else
    {
        info.GetReturnValue().Set(v8::Boolean::New(isolate, false));
        return;
    }

    info.GetReturnValue().Set(v8::Boolean::New(isolate, true));
    return;
};

void Config::GetOfType(const v8::FunctionCallbackInfo<v8::Value> &info)
{
    v8::Isolate *isolate = info.GetIsolate();

    if (info.Length() != 2)
    {
        isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, "Wrong number of arguments").ToLocalChecked()));
        info.GetReturnValue().Set(v8::Null(isolate));
        return;
    }

    if (!info[0]->IsString())
    {
        isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, "Wrong arguments").ToLocalChecked()));
        info.GetReturnValue().Set(v8::Null(isolate));
        return;
    }

    if (!info[1]->IsNumber())
    {
        isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, "Wrong arguments").ToLocalChecked()));
        info.GetReturnValue().Set(v8::Null(isolate));
        return;
    }

    int type = info[1]->ToNumber(isolate->GetCurrentContext()).ToLocalChecked()->Int32Value(isolate->GetCurrentContext()).ToChecked();
    v8::String::Utf8Value const str(isolate, info[0]->ToString(isolate->GetCurrentContext()).ToLocalChecked());

    std::string key = std::string(*str, str.length());

    Config *cfg = node::ObjectWrap::Unwrap<Config>(info.Holder());

    auto value = cfg->_node[key];

    try
    {
        auto v8Value = GetValueOfType(isolate, static_cast<ConfigValueType>(type), value);
        info.GetReturnValue().Set(v8Value);
        return;
    }
    catch (...)
    {
        const std::string errorMsg = std::string("Wrong value type: " + std::to_string(type) + " for key: " + key);
        isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, errorMsg.c_str()).ToLocalChecked()));
    }

    info.GetReturnValue().Set(v8::Null(isolate));
    return;
};

void Config::Save(const v8::FunctionCallbackInfo<v8::Value> &info)
{
    v8::Isolate *isolate = info.GetIsolate();

    bool useCommas = false;
    bool useApostrophe = false;

    if (info.Length() > 0 && info[0]->IsBoolean())
    {
        useCommas = info[0]->ToBoolean(isolate)->Value();
    }

    if (info.Length() > 1 && info[1]->IsBoolean())
    {
        useApostrophe = info[1]->ToBoolean(isolate)->Value();
    }

    try
    {
        Config *cfg = node::ObjectWrap::Unwrap<Config>(info.Holder());
        helper::Save(cfg->_name, cfg->_node, useCommas, useApostrophe);
    }
    catch (...)
    {
        info.GetReturnValue().Set(v8::Boolean::New(isolate, false));
        return;
    }

    info.GetReturnValue().Set(v8::Boolean::New(isolate, true));
    return;
}

void Config::Serialize(const v8::FunctionCallbackInfo<v8::Value> &info)
{
    v8::Isolate *isolate = info.GetIsolate();

    bool useCommas = false;
    bool useApostrophe = false;

    if (info.Length() > 0 && info[0]->IsBoolean())
    {
        useCommas = info[0]->ToBoolean(isolate)->Value();
    }

    if (info.Length() > 1 && info[1]->IsBoolean())
    {
        useApostrophe = info[1]->ToBoolean(isolate)->Value();
    }

    std::string content;

    try
    {
        Config *cfg = node::ObjectWrap::Unwrap<Config>(info.Holder());
        content = helper::Serialize(cfg->_node, useCommas, useApostrophe);
    }
    catch (...)
    {
        isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, "Unable to serialize").ToLocalChecked()));
        return;
    }

    info.GetReturnValue().Set(v8::String::NewFromUtf8(isolate, content.c_str()).ToLocalChecked());
    return;
}