#include <node.h>
#include <node_object_wrap.h>

#include "helper.h"

enum ConfigValueType
{
    Boolean,
    Number,
    String,
    List,
    Dict
};

class Config : public node::ObjectWrap {
    public:
        static void Init(v8::Local<v8::Object> exports);
        //Config(const Napi::CallbackInfo &info);
        //static Napi::Value Load(const Napi::CallbackInfo &info);

    private:
        explicit Config();
        ~Config();

        static void New(const v8::FunctionCallbackInfo<v8::Value> &args);

        static void Get(const v8::FunctionCallbackInfo<v8::Value> &info);
        static void Set(const v8::FunctionCallbackInfo<v8::Value> &info);
        static void GetOfType(const v8::FunctionCallbackInfo<v8::Value> &info);
        static void Save(const v8::FunctionCallbackInfo<v8::Value> &info);

        //void GetValueUnknownType(Napi::Env env, alt::config::Node value);
        //void GetValueOfType(Napi::Env env, int type, alt::config::Node value);

        alt::config::Node _node;
        std::wstring _name;
};