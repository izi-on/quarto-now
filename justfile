client_dir := "client/quarto-now"
server_dir := "server/"

run-client: 
  just {{client_dir}}/run

run-server:
  just {{server_dir}}/run
