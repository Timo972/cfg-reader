#include <string>
#include <fstream>

#include "alt-config.h"
namespace altWrapper {
    alt::config::Node Load(const std::wstring &fileName);
    bool Save(const std::wstring &fileName, alt::config::Node node);
}