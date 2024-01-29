export default function Expandable({
  header,
  isOpen,
  onHeaderClicked,
  children,
}) {
  const clickHandler = () => {
    if (onHeaderClicked) {
      onHeaderClicked();
    }
  };

  return (
    <div>
      <div onClick={clickHandler}>{header}</div>
      {isOpen && <div>{children}</div>}
    </div>
  );
}
