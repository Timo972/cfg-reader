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

    alt::config::Node SerializeValue(Napi::Value value)
    {
        if (value.IsNumber())
        {
            double serialized = value.As<Napi::Number>().DoubleValue();
            return serialized;
        }
        else if (value.IsBoolean())
        {
            bool serialized = value.As<Napi::Boolean>().Value();
            return serialized;
        }
        else if (value.IsString())
        {
            std::string serialized = value.As<Napi::String>().Utf8Value();
            return serialized;
        }
        else if (value.IsArray())
        {
            return NapiArrayToList(value.As<Napi::Array>());
        }
        else if (value.IsObject())
        {
            return NapiObjectToDict(value.As<Napi::Object>());
        }

        throw alt::config::Error{"Invalid value passed"};
    }

    alt::config::Node NapiObjectToDict(Napi::Object object)
    {
        Napi::Array propNames = object.GetPropertyNames();
        alt::config::Node::Dict dict;

        for (uint32_t i = 0; i < propNames.Length(); i++)
        {
            Napi::Value propKey = propNames.Get(i);
            Napi::Value propValue = object.Get(propKey);
            auto serializedKey = propKey.As<Napi::String>().Utf8Value();
            auto serializedValue = SerializeValue(propValue);

            dict.insert(std::make_pair(serializedKey, serializedValue));
        }

        return dict;
    }

    alt::config::Node NapiArrayToList(Napi::Array array)
    {
        alt::config::Node::List list;

        for (uint32_t i = 0; i < array.Length(); i++)
        {
            Napi::Value arrValue = array.Get(i);
            auto serializedValue = SerializeValue(arrValue);

            list.push_back(serializedValue);
        }

        return list;
    }
}