;; gorilla-repl.fileformat = 1

;; **
;;; # Gorilla REPL
;;; 
;;; Welcome to gorilla ...

;; @@
(defn f
  [x y]
  (let [q (* 2 x)
        p (* 3 y)]
    (+ p q)))
;; => 
;;; #'user/f
;; <=


;; **
;;; Some notes could go here.

;; @@
(f 20 30)
;; => 
;;; 130
;; <=


;; @@
(doall (map println (range 10)))
;; ->
;;; 0
;;; 1
;;; 2
;;; 3
;;; 4
;;; 5
;;; 6
;;; 7
;;; 8
;;; 9
;;; 
;; <-
;; => 
;;; (nil nil nil nil nil nil nil nil nil nil)
;; <=


;; @@