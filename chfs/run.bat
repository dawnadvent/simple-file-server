@echo off
set home=%cd%
%home%\bin\chfs.exe --path="%home%\shared" --port=2000 --log="%home%\logs" --rule="::rwd|tom:123456:rwd"
