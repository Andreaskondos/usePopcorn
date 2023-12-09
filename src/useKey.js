import { useEffect } from "react";

export function useKey(keyCode, callback) {
  useEffect(
    function () {
      function keyEffect(e) {
        if (e.code.toLowerCase() === keyCode.toLowerCase()) {
          callback();
        }
      }
      document.addEventListener("keydown", keyEffect);
      // refEl?.current.focus();

      return function () {
        document.removeEventListener("keydown", keyEffect);
      };
    },
    [keyCode, callback]
  );
}
