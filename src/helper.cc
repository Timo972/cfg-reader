#include <string>
#include <fstream>

#include "alt-config.h"
namespace altWrapper
{
    alt::config::Node Load(const std::wstring &fileName)
    {
        std::ifstream ifile(fileName);
        if(!ifile.good()) {
            return false;
        }
        alt::config::Parser parser(ifile);
        try
        {
            auto node = parser.Parse();
            //test = node["test"].ToBool(true);
            //test = node["test"].ToString("true");

            return node;
        }
        catch (const alt::config::Error &e)
        {
            std::cout << e.what() << std::endl;
        }
        return false;
    }

    bool Save(const std::wstring &fileName, alt::config::Node node)
    {
        // node["test"] = test;
        std::ofstream ofile(fileName);
        alt::config::Emitter().Emit(node, ofile);
        return true;
    }
}