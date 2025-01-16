export KREDEUM_MASSA_ADDRESS=AS1XWJvC1PRym63Pb7ctaga1Wdvz34jXSuDxHBJQiddS6mkqRVVy

# kredeum.massa addres should be $KREDEUM_MASSA_ADDRESS

# ./deweb directory contains index.html static webpage

# upload file on kredeum.massa
deweb upload deweb -a $KREDEUM_MASSA_ADDRESS

# list files on kredeum.massa
deweb list -a $KREDEUM_MASSA_ADDRESS

# show index.html
deweb show index.html -a $KREDEUM_MASSA_ADDRESS

# howto visualize the website in browser ?

# runnning deweb server locally
deweb-server

# open index.html in browser http://localhost:8080
# enter kredeum.massa => but not found