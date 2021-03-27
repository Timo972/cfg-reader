#include <string>
#include <fstream>
#pragma warning( disable : 4101)
#include "alt-config.h"
namespace altWrapper {
    alt::config::Node Load(const std::string &fileName);

    bool Save(const std::string &fileName, alt::config::Node node);
}