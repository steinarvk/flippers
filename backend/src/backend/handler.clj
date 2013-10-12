(ns backend.handler
  (:use compojure.core)
  (:require [compojure.handler :as handler]
            [com.ashafa.clutch :as clutch]
            [cheshire.core :as json]
            [hiccup.core :as hiccup]
            [ring.middleware.params :as params]
            [compojure.route :as route]))

(def main-page
  (hiccup/html
   [:form {:action "/flippers-server/add-puzzle"
           :method "POST"}
    [:textarea {:name "puzzledata"}]
    [:input {:type "submit"}]]))

(defn feedback [message]
  (hiccup/html
   [:p message]
   [:a {:href "/flippers-server/"} "Back"]))

(defroutes app-core-routes
  (POST "/flippers-server/add-puzzle" [puzzledata]
        (feedback (str puzzledata)))
  (GET "/flippers-server/" [] main-page)
  (route/resources "/")
  (route/not-found "Not Found"))

(def app-routes (params/wrap-params app-core-routes))
             
(def app
  (handler/site app-routes))
