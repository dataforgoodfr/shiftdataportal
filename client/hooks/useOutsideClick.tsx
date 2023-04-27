import { useEffect } from "react";

const useOutsideClick = (ref, callback) => {
  const handleClick = e => {
    if (
      ref.current &&
      !ref.current.contains(e.target) &&
      // This is to fix a bug that was closing the Popup in GroupNamesSelect
      // when clicking on a multi-select input. This input would be removed
      // from DOM when selected (normal behavior) then useOutsideClick would
      // see that it's not a children of popup because it's not there anymore
      // so it would trigger the callback. So we also check if this DOM element
      // is still part of the page
      document.contains(e.target)
    ) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  });
};

export default useOutsideClick;
