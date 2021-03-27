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
        explicit Config(std::string fileName);
        ~Config();

        static void New(const v8::FunctionCallbackInfo<v8::Value> &args);

        static void Get(const v8::FunctionCallbackInfo<v8::Value> &info);
        static void Set(const v8::FunctionCallbackInfo<v8::Value> &info);
        static void GetOfType(const v8::FunctionCallbackInfo<v8::Value> &info);
        static void Save(const v8::FunctionCallbackInfo<v8::Value> &info);

        static v8::Local<v8::Value> GetValueUnknownType(v8::Isolate* isolate, alt::config::Node value);
        static v8::Local<v8::Value> GetValueOfType(v8::Isolate * isolate, int type, alt::config::Node value);

        alt::config::Node _node;
        std::string _name;
};