#include <string>
#include <fstream>
#pragma warning(disable : 4101)
#include "alt-config.h"
#include <napi.h>
namespace helper
{
    alt::config::Node Load(const std::string &fileName);

    bool Save(const std::string &fileName, alt::config::Node node);

    std::string Serialize(alt::config::Node node);

    alt::config::Node SerializeValue(Napi::Value value);

    alt::config::Node NapiObjectToDict(Napi::Object object);
    alt::config::Node NapiArrayToList(Napi::Array array);
}