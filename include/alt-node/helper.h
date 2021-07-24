#include <node.h>
#include <string>
#include <fstream>
#pragma warning(disable : 4101)
#include "alt-config.h"
namespace helper
{
    alt::config::Node Load(std::ifstream &ifile);

    bool Save(const std::string &fileName, alt::config::Node node, bool useCommas = true, bool useApostrophe = true);

    std::string Serialize(alt::config::Node node, bool useCommas = true, bool useApostrophe = true);

    alt::config::Node SerializeValue(v8::Isolate *isolate, v8::Local<v8::Value> value);

    alt::config::Node V8ObjectToDict(v8::Isolate *isolate, v8::Local<v8::Object> object);
    alt::config::Node V8ArrayToList(v8::Isolate *isolate, v8::Local<v8::Array> array);
}