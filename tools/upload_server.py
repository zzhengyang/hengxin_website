#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
本地静态站点 + 上传服务（仅用于本机开发/运维）

- GET: 作为静态文件服务器（等价于 python -m http.server）
- POST /api/upload: 接收 multipart/form-data，把图片保存到 assets/uploads/ 并返回可访问的 URL

使用：
  cd /Users/zhengyang/Documents/zy/hengxin
  python3 tools/upload_server.py --bind 127.0.0.1 --port 5173
然后访问：
  http://127.0.0.1:5173/ops.html
"""

from __future__ import annotations

import argparse
import json
import os
import secrets
import sys
from datetime import datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
UPLOAD_DIR = ROOT / "assets" / "uploads"


def _safe_ext(filename: str) -> str:
    name = (filename or "").lower().strip()
    ext = "".join(Path(name).suffixes[-1:])  # last suffix only
    if not ext or len(ext) > 12:
        return ".jpg"
    if not all(c.isalnum() or c == "." for c in ext):
        return ".jpg"
    return ext


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, fmt: str, *args) -> None:
        sys.stderr.write("%s - - [%s] %s\n" % (self.client_address[0], self.log_date_time_string(), fmt % args))

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path != "/api/upload":
            self.send_error(404, "Not Found")
            return

        ctype = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in ctype:
            self.send_error(400, "Expected multipart/form-data")
            return

        # 解析 multipart（cgi 在 3.13 标记弃用，但 3.12/3.11 仍可用；本项目本地工具足够）
        import cgi  # noqa: PLC0415

        try:
            fs = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={
                    "REQUEST_METHOD": "POST",
                    "CONTENT_TYPE": self.headers.get("Content-Type"),
                },
            )
        except Exception as e:
            self.send_error(400, f"Bad multipart: {e}")
            return

        if "files" not in fs:
            self.send_error(400, "No files field")
            return
        files = fs["files"]
        # cgi.FieldStorage 不能做 bool 判断；并且多文件时可能返回 list
        if files is None:
            self.send_error(400, "No files field")
            return
        if not isinstance(files, list):
            files = [files]
        if len(files) == 0:
            self.send_error(400, "No files field")
            return

        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        day = datetime.now().strftime("%Y-%m-%d")
        out_urls: list[str] = []

        for item in files:
            if not getattr(item, "file", None):
                continue
            filename = getattr(item, "filename", "") or "image.jpg"
            ext = _safe_ext(filename)
            token = secrets.token_hex(8)
            out_name = f"{day}-{token}{ext}"
            out_path = UPLOAD_DIR / out_name
            try:
                with open(out_path, "wb") as f:
                    f.write(item.file.read())
            except Exception as e:
                self.send_error(500, f"Write failed: {e}")
                return
            # 返回站点可访问的相对路径
            out_urls.append(f"./assets/uploads/{out_name}")

        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(json.dumps({"urls": out_urls}, ensure_ascii=False).encode("utf-8"))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--bind", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=5173)
    args = parser.parse_args()

    os.chdir(ROOT)  # 静态文件根目录
    httpd = ThreadingHTTPServer((args.bind, args.port), Handler)
    print(f"Serving on http://{args.bind}:{args.port} (root: {ROOT})")
    print("Upload endpoint: POST /api/upload (field name: files)")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()

