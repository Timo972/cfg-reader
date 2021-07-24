#include "helper.h"

namespace helper
{
    alt::config::Node Load(std::ifstream &ifile)
    {

        alt::config::Parser parser(ifile);
        try
        {
            auto node = parser.Parse();

            return node;
        }
        catch (const alt::config::Error &e)
        {
            std::cout << e.what() << std::endl;
            return alt::config::Node();
        }
    }

    bool Save(const std::string &fileName, alt::config::Node node, bool useCommas, bool useApostrophe)
    {
        std::ofstream ofile(fileName);
        alt::config::Emitter().Emit(node, ofile, 0, true, useCommas, useApostrophe);
        return true;
    }

    std::string Serialize(alt::config::Node node, bool useCommas, bool useApostrophe)
    {
        std::stringstream out;

        alt::config::Emitter().Emit(node, out, 0, true, useCommas, useApostrophe);

        return out.str();
    }

    alt::config::Node SerializeValue(v8::Isolate *isolate, v8::Local<v8::Value> value)
    {
        if (value->IsNumber())
        {
            double serialized = value->ToNumber(isolate->GetCurrentContext()).ToLocalChecked()->Value();
            return serialized;
        }
        else if (value->IsBoolean())
        {
            bool serialized = value->ToBoolean(isolate)->Value();
            return serialized;
        }
        else if (value->IsString())
        {
            v8::String::Utf8Value const str(isolate, value->ToString(isolate->GetCurrentContext()).ToLocalChecked());
            std::string serialized = std::string(*str, str.length());
            return serialized;
        }
        else if (value->IsArray())
        {
            return V8ArrayToList(isolate, v8::Local<v8::Array>::Cast(value));
        }
        else if (value->IsObject())
        {
            return V8ObjectToDict(isolate, v8::Local<v8::Object>::Cast(value));
        }

        throw alt::config::Error{"Invalid value passed"};
    }

    alt::config::Node V8ObjectToDict(v8::Isolate *isolate, v8::Local<v8::Object> object)
    {
        v8::Local<v8::Array> propNames = object->GetPropertyNames(isolate->GetCurrentContext()).ToLocalChecked();
        alt::config::Node::Dict dict;

        for (uint32_t i = 0; i < propNames->Length(); i++)
        {
            v8::Local<v8::Value> propKey = propNames->Get(isolate->GetCurrentContext(), i).ToLocalChecked();
            v8::Local<v8::Value> propValue = object->Get(isolate->GetCurrentContext(), propKey).ToLocalChecked();

            v8::String::Utf8Value const str(isolate, propKey->ToString(isolate->GetCurrentContext()).ToLocalChecked());
            std::string serializedKey = std::string(*str, str.length());

            auto serializedValue = SerializeValue(isolate, propValue);

            dict.insert(std::make_pair(serializedKey, serializedValue));
        }

        return dict;
    }

    alt::config::Node V8ArrayToList(v8::Isolate *isolate, v8::Local<v8::Array> array)
    {
        alt::config::Node::List list;

        for (uint32_t i = 0; i < array->Length(); i++)
        {
            v8::Local<v8::Value> arrValue = array->Get(isolate->GetCurrentContext(), i).ToLocalChecked();

            auto serializedValue = SerializeValue(isolate, arrValue);

            list.push_back(serializedValue);
        }

        return list;
    }
}