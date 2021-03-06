#include <napi.h>

#include "helper.h"

enum ConfigValueType
{
    Boolean,
    Number,
    String,
    List,
    Dict
};

class Config : public Napi::ObjectWrap<Config> {
    public:
        static Napi::Object Init(Napi::Env env, Napi::Object exports);
        Config(const Napi::CallbackInfo &info);

    private:
        Napi::Value Get(const Napi::CallbackInfo &info);
        Napi::Value Set(const Napi::CallbackInfo &info);
        Napi::Value GetOfType(const Napi::CallbackInfo &info);
        Napi::Value Save(const Napi::CallbackInfo &info);

        Napi::Value Serialize(const Napi::CallbackInfo &info);

        Napi::Value GetValueUnknownType(Napi::Env env, alt::config::Node value);
        Napi::Value GetValueOfType(Napi::Env env, int type, alt::config::Node value);

        alt::config::Node SerializeValue(Napi::Value value);

        alt::config::Node _node;
        std::string _name;
};