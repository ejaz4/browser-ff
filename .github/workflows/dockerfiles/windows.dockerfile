FROM mcr.microsoft.com/windows:20H2

ENV CI_SKIP_INIT=true

# Mount working directory
RUN mkdir C:\worker
RUN mkdir C:\worker\build
WORKDIR C:\worker\build

SHELL ["cmd", "/S", "/C"]

RUN powershell -Command iex ((new-object net.webclient).DownloadString('https://chocolatey.org/install.ps1'))
RUN powershell -Command Invoke-Expression (New-Object System.Net.WebClient).DownloadString('https://get.scoop.sh')
RUN choco install -y git.install
RUN choco install -y nodejs
RUN choco install -y curl
RUN choco install -y 7zip
RUN choco install -y sed
RUN choco install -y python --version 3.8.3

RUN curl https://cdn.dothq.co/artifacts/tools/mozilla-build.zip -o mozilla-build.zip
RUN 7z x mozilla-build.zip -aoa -oC:\mozilla-build 

RUN git.exe config --global user.email "72629236+dothq-robot@users.noreply.github.com"
RUN git.exe config --global user.name "dothq-robot"
RUN git.exe config --global core.autocrlf false

RUN git.exe clone https://github.com/dothq/browser-ff
WORKDIR C:\worker\build\browser-ff

RUN sed.exe -i '/ac_add_options --with-ccache=sccache/s/^/#/g' C:\worker\build\browser-ff\configs\windows\mozbuild && cat C:\worker\build\browser-ff\configs\windows\mozbuild

RUN npm i typescript

WORKDIR C:\worker\build\browser-ff\.github\workflows\dockerfiles
CMD run.bat