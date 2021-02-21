#include <napi.h>
#include <iostream>
#include <fstream>
#include <string>

#include "alt-config.h"

#include "convert.h"

alt::config::Node Load(const std::wstring& fileName)
{
    std::ifstream ifile(fileName);
    alt::config::Parser parser(ifile);
    try
    {
        auto node = parser.Parse();
        //test = node["test"].ToBool(true);
        //test = node["test"].ToString("true");

        return node;
    }
    catch (const alt::config::Error& e)
    {
        std::cout << e.what() << std::endl;
    }
    return false;
}

bool Save(const std::wstring& fileName, alt::config::Node node)
{
    // node["test"] = test;
    std::ofstream ofile(fileName);
    alt::config::Emitter().Emit(node, ofile);
    return true;
}

Napi::Boolean SaveFile(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() != 1) {
        Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }    

    if (!info[0].IsString()) {
        Napi::TypeError::New(env, "Wrong arguments").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }

    auto fileName = info[0].As<Napi::String>().Utf8Value();

    auto wFileName = to_wstring(fileName);

    auto saved = true; //Save(test);

    return Napi::Boolean::New(env, saved);
}

Napi::Object ReadFile(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() != 1) {
        Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
        //return env.Null();
    }

    if (!info[0].IsString()) {
        Napi::TypeError::New(env, "Wrong arguments").ThrowAsJavaScriptException();
        //return env.Null();
    }

    auto fileName = info[0].As<Napi::String>().Utf8Value();
    auto wFileName = to_wstring(fileName);

    auto node = Load(wFileName);

    auto configClassInstance = Napi::Object::New(env);

    return configClassInstance;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("Load", Napi::Function::New(env, ReadFile));
    //deprecated
    exports.Set("load", Napi::Function::New(env, ReadFile));
    return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)