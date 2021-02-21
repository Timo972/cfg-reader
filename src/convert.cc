#include <string>
#include <codecvt>
#include <locale>

using convert_t = std::codecvt_utf8<wchar_t>;
std::wstring_convert<convert_t, wchar_t> strconverter;

std::wstring to_wstring(std::string str)
{
    return strconverter.from_bytes(str);
}

std::string to_string(std::wstring wstr)
{
    return strconverter.to_bytes(wstr);
}
