#include "config.h"

#ifdef DEBUG
#include <iostream>
#endif

Napi::Object Config::Init(Napi::Env env, Napi::Object exports)
{
    Napi::Function func = DefineClass(env, "Config", {InstanceMethod<&Config::Get>("get"), InstanceMethod<&Config::GetOfType>("getOfType"), InstanceMethod<&Config::Set>("set"), InstanceMethod<&Config::Save>("save"), InstanceMethod<&Config::Serialize>("serialize")});

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

    if (info.Length() > 1 && (!info[1].IsObject() && !info[1].IsBoolean()))
    {
        Napi::TypeError::New(env, "Wrong arguments").ThrowAsJavaScriptException();
        return;
    }

    const std::string fileName = info[0].As<Napi::String>().Utf8Value();
    std::ifstream file(fileName.c_str());
    bool exists = file.good();

    this->_name = fileName;

    alt::config::Node node;
    bool createFileIfNotExist = false;

    if (info.Length() > 1 && info[1].IsBoolean())
        createFileIfNotExist = info[1].As<Napi::Boolean>().Value();
    else if (info.Length() > 1 && info[1].IsObject())
        createFileIfNotExist = true;

    if (exists)
    {
        node = helper::Load(file);
    }
    else if (!createFileIfNotExist)
    {
        Napi::TypeError::New(env, "File does not exist").ThrowAsJavaScriptException();
        return;
    }
    else
    {
        if (info[1].IsObject())
        {
#ifdef DEBUG
            std::cout << "Config::Config config file does not exist, using predefined values" << std::endl;
#endif
            node = alt::config::Node(helper::NapiObjectToDict(info[1].As<Napi::Object>()));
        }
        else
        {
#ifdef DEBUG
            std::cout << "Config::Config config file does not exist, creating empty config" << std::endl;
#endif
            node = alt::config::Node(helper::NapiObjectToDict(Napi::Object::New(env)));
        }
    }

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

Napi::Value Config::Serialize(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();

    bool useCommas = false;

    if (info.Length() > 0 && info[0].IsBoolean())
    {
        useCommas = info[0].ToBoolean().Value();
    }

    std::string content = helper::Serialize(this->_node, useCommas);

    return Napi::String::New(env, content);
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

    alt::config::Node value;

    try
    {
        value = this->_node[key];
    }
    catch (...)
    {
        return env.Null();
    }

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

    if (!info[1].IsNumber() && !info[1].IsBoolean() && !info[1].IsString() && !info[1].IsArray() && !info[1].IsObject())
    {
        Napi::TypeError::New(env, "Unsupported value type").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }

    std::string key = info[0].As<Napi::String>().Utf8Value();

    try
    {
        auto value = helper::SerializeValue(info[1]);

#ifdef DEBUG
        std::cout << "Config::Set serialized value: " << value << std::endl;
#endif

        this->_node[key] = value;

#ifdef DEBUG
        std::cout << "Config::Set setted value to alt::config::Node key: " << key << std::endl;
#endif

        return Napi::Boolean::New(env, true);
    }
    catch (const std::exception &e)
    {
#ifdef DEBUG
        std::cout << "Config::Set ERROR: " << e.what() << std::endl;
#endif
        const std::string errorMsg = std::string("Unsupported value at key: " + key);
        Napi::Error::New(env, errorMsg).ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }
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

    bool useCommas = false;

    if (info.Length() > 0 && info[0].IsBoolean())
    {
        useCommas = info[0].ToBoolean().Value();
    }

    try
    {
        helper::Save(this->_name, this->_node, useCommas);
    }
    catch (...)
    {
        return Napi::Boolean::New(env, false);
    }

    return Napi::Boolean::New(env, true);
}
