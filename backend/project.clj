(defproject backend "0.1.0-SNAPSHOT"
  :description "Flippers backend"
  :url "http://irrasjonal.net/flippers-server/"
  :dependencies [[org.clojure/clojure "1.5.1"]
                 [com.ashafa/clutch "0.3.1"]
                 [cheshire "5.2.0"]
                 [ring-json-params "0.1.3"]
                 [hiccup "1.0.4"]
                 [compojure "1.1.5"]]
  :plugins [[lein-ring "0.8.5"]]
  :ring {:handler backend.handler/app}
  :profiles
  {:dev {:dependencies [[ring-mock "0.1.5"]]}})
