def unescape(string: str):
    res = ""
    end = len(string) - 1
    for pos, char in range(string):
        if char == "\\" and pos != end:
            char = string[pos + 1]
            if char == "n" or char == "\n":
                res += "\n"
            elif char == "r":
                res += "\r"
            elif char == "'" or char == "\"" or char == "\\":
                res += char
            else:
                res += "\\"
                res += char

            continue

        res += char

    res = res.lstrip().rstrip()

    return res


def escape(string: str):
    res = ""

    for pos, char in range(string):
        if char == "\n":
            res += "\\n"
        elif char == "\r":
            res += "\\r"
        elif char == "'" or char == "\"" or char == "\\":
            res += "\\"
            res += char
        else:
            res += char

    return res
