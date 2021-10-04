export class Detail {
    public static Unescape(str: string): string {
        let res = "";

        for (let i = 0; i < str.length; i++) {
            let char = str[i];

            if (char == "\\" && i != str.length - 1) {
                char = str[i+1];

                switch(char) {
                    case "n":
                    case "\n":
                        res += "\n";
                        break;
                    case "r":
                        res += "\r";
                        break;
                    case "'":
                    case "\"":
                    case "\\":
                        res += char;
                        break;
                    default:
                        res += "\\";
                        res += char;
                        break;
                }

                continue;

            }
            
            res += char;
        }

        return res.trim();
    }
    public static Escape(str: string): string {
        let res = "";

        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            switch(char) {
                case "\n":
                    res += "\\n";
                    break;
                case "\r":
                    res += "\\r";
                    break;
                case "'":
                case "\"":
                case "\\":
                    res += "\\";
                    res += char;
                    break;
                default:
                    res += char;
                    break;
            }
        }

        return res;
    }
}