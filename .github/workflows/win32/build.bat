./melon download 
cd src
git.exe init
git.exe config core.autocrlf false
git.exe checkout --orphan ff
git.exe add .
git.exe commit -am "Firefox"
git.exe checkout -b dot
cd ..
./melon fix-le
./melon import
type nul > C:\script
echo PATH="$PATH:/c/Program Files/nodejs" >> C:\script
echo echo $PATH >> C:\script
echo cd /c/worker/build/browser-ff/src >> C:\script
echo MOZCONFIG=../configs/windows/mozconfig ./mach build >> C:\script
echo MOZCONFIG=../configs/windows/mozconfig ./mach package >> C:\script
C:\mozilla-build\start-shell.bat "C:\script"