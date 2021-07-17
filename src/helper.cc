#include "helper.h"

namespace altWrapper
{
    alt::config::Node Load(const std::string &fileName)
    {
        std::ifstream ifile(fileName);
        if (!ifile.good())
        {
            return false;
        }
        alt::config::Parser parser(ifile);
        try
        {
            auto node = parser.Parse();

            return node;
        }
        catch (const alt::config::Error &e)
        {
            std::cout << e.what() << std::endl;
        }
        return false;
    }

    bool Save(const std::string &fileName, alt::config::Node node)
    {
        std::ofstream ofile(fileName);
        alt::config::Emitter().Emit(node, ofile);
        return true;
    }

    std::string Serialize(alt::config::Node node)
    {
        std::stringstream out;

        alt::config::Emitter().Emit(node, out);

        return out.str();
    }
}