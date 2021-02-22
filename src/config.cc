#include "config.h"
#include "convert.h"

Napi::Object Config::Init(Napi::Env env, Napi::Object exports)
{
    Napi::Function func = DefineClass(env, "Config", {
        InstanceMethod<&Config::Get>("Get"), 
        InstanceMethod<&Config::GetOfType>("GetOfType"),
        InstanceMethod<&Config::Set>("Set"),
        InstanceMethod<&Config::Save>("Save")
    });

    Napi::FunctionReference *constructor = new Napi::FunctionReference();

    *constructor = Napi::Persistent(func);

    exports.Set("Config", func);

    env.SetInstanceData<Napi::FunctionReference>(constructor);

    return exports;
};

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
    if (type == 0)
    {
        auto boolean = value.ToBool();
        return Napi::Boolean::New(env, boolean);
    }
    else if (type == 1)
    {
        auto number = value.ToNumber();
        return Napi::Number::New(env, number);
    }
    else if (type == 2)
    {
        auto string = value.ToString();
        return Napi::String::New(env, string);
    }
}

Napi::Value Config::Get(const Napi::CallbackInfo &info)
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

    if (!value.IsDict() && !value.IsList())
    {
        for (int i = 0; i < 3; i++)
        {
            try
            {
                return GetValueOfType(env, i, value);
            }
            catch (...)
            {
            }
        }
        const std::string errorMsg = std::string("Unknown value at key: " + key);
        Napi::Error::New(env, errorMsg).ThrowAsJavaScriptException();
        return env.Null();
    }

    if (value.IsDict())
    {
        auto dict = value.ToDict();
    }

    if (value.IsList())
    {
        auto list = value.ToList();
    }
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

    std::string key = info[1].As<Napi::String>().Utf8Value();

    auto valueNode = this->_node[key];

    if (info[1].IsNumber())
    {
        double value = info[1].As<Napi::Number>().DoubleValue();
        //value = valueNode.ToNumber(value);
        this->_node[key] = value;
    }
    else if (info[1].IsBoolean())
    {
        bool value = info[1].As<Napi::Boolean>().Value();
        //value = valueNode.ToBool(value);
        this->_node[key] = value;
    }
    else if (info[1].IsString())
    {
        std::string value = info[1].As<Napi::String>().Utf8Value();
        //value = valueNode.ToString(value);
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