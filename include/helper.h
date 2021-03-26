#include <string>
#include <fstream>

#include "alt-config.h"
namespace altWrapper {
    alt::config::Node Load(const std::string &fileName);

    bool Save(const std::string &fileName, alt::config::Node node);
}