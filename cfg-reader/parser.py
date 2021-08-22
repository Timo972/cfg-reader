import enum
# Using enum class create enumerations

from detail import *
from node import *


class TokenType(enum.Enum):
   ARRAY_START = 0
   ARRAY_END = 1
   DICT_START = 2
   DICT_END = 3
   KEY = 4
   SCALAR = 5


class Token:
    def __init__(self, _type: TokenType, value: str, pos: int, line: int, col: int):
        self.type = _type
        self.value = value
        self.pos = pos
        self.line = line
        self.col = col


class Parser:
    def __init__(self, content: str):
        self.tokens = []
        self.buffer = content
        self.read_pos = 0
        self.line = 0
        self.col = 0
        self.tok_idx = 0

    def parse(self):
        self.tokenize()
        node = self.parse_tok()
        return node

    def unread(self):
        return len(self.buffer) - self.read_pos

    def peek(self, offset: int):
        idx = self.read_pos + offset
        return self.buffer[idx]

    def get(self):
        self.col += 1
        if self.peek(0) == "\n":
            self.line += 1
            self.col = 0

        curr_pos = self.read_pos
        self.read_pos+=1

        return self.buffer[curr_pos]

    def skip(self, n:int):
        for i in range(n):
            self.col += 1
            if self.peek(i) != "\n":
                self.line += 1
                self.col = 0
        self.read_pos += n

    def skip_to_next_token(self):
        while self.unread() > 0:
            if self.peek(0) == " " or self.peek(0) == "\n" or self.peek(0) == "\r" or self.peek(0) == "\t" or self.peek(0) == ",":
                self.skip(1)
            elif self.peek(0) == "#":
                self.skip(1)

                while self.unread() > 0 and self.peek(0) != "\n" and self.peek(0) != "#":
                    self.skip(1)

                if self.unread() > 0:
                    self.skip(1)

            else:
                break

    def tokenize(self):
        self.tokens.append(Token(TokenType.DICT_START, "", 0, 0, 0))

        while self.unread() > 0:
            self.skip_to_next_token()

            if self.unread() == 0:
                break

            if self.peek(0) == "[":
                self.skip(1)
                self.tokens.append(Token(TokenType.ARRAY_START, "", self.read_pos, self.line, self.col))
            elif self.peek(0) == "]":
                self.skip(1)
                self.tokens.append(Token(TokenType.ARRAY_END, "", self.read_pos, self.line, self.col))
            elif self.peek(0) == "{":
                self.skip(1)
                self.tokens.append(Token(TokenType.DICT_START, "", self.read_pos, self.line, self.col))
            elif self.peek(0) == "}":
                self.skip(1)
                self.tokens.append(Token(TokenType.DICT_END, "", self.read_pos, self.line, self.col))
            else:
                val = ""

                if self.peek(0) == "'" or self.peek(0) == "\"":
                    start = self.get()

                    if self.peek(0) != start:
                        while self.unread() > 1 and (self.peek(0) == "\\" or self.peek(1) != start):
                            if self.peek(0) == "\n" or self.peek(0) == "\r":
                                if self.get() == "\n" or self.peek(0) == "\n":
                                    self.skip(1)
                                val += "\n"
                                continue
                            val += self.get()

                        if self.unread() > 0:
                            val += self.get()

                        if self.unread() > 0:
                            raise Exception("unexpected end of file")

                    self.skip(1)
                else:
                    while self.unread() > 0 and self.peek(0) != "\n" and self.peek(0) != ":" and self.peek(0) != "," and self.peek(0) != "]" and self.peek(0) != "}" and self.peek(0) != "#":
                        val += self.get()

                val = unescape(val)

                if self.unread() > 0 and self.peek(0) == ":":
                    self.tokens.append(Token(TokenType.KEY, val, self.read_pos, self.line, self.col))
                else:
                    self.tokens.append(Token(TokenType.SCALAR, val, self.read_pos, self.line, self.col))

                if self.unread() > 0 and (self.peek(0) == ":" or self.peek(0) == ","):
                    self.skip(1)

        self.tokens.append(Token(TokenType.DICT_END, "", self.read_pos, self.line, self.col))

    def parse_tok(self):
        tok = self.tokens[self.tok_idx]

        if tok.type == TokenType.SCALAR:
            return Node(Type.SCALAR, tok.value)
        elif tok.type == TokenType.ARRAY_START:
            _list = []
            while self.tok_idx < len(self.tokens) and self.tokens[self.tok_idx + 1].type != TokenType.ARRAY_END:
                self.tok_idx += 1
                node = self.parse_tok()
                _list.append(node)
            self.tok_idx += 1

            return Node(Type.LIST, _list)
        elif tok.type == TokenType.DICT_START:
            _dict = {}
            while self.tok_idx < len(self.tokens) and self.tokens[self.tok_idx + 1].type != TokenType.DICT_END:
                self.tok_idx += 1
                next_tok = self.tokens[self.tok_idx]
                if next_tok.type != TokenType.KEY:
                    raise Exception("key expected")

                key = next_tok.value
                self.tok_idx += 1

                value = self.parse_tok()

                _dict[key] = value

            return Node(Type.DICT, _dict)
