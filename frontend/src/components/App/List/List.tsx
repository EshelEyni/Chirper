import "./List.scss";

type ListProps<T> = {
  items: T[];
  render: (item: T) => JSX.Element;
  className?: string;
};

export const List = <T,>({ items, render, className }: ListProps<T>) => {
  return <section className={`list ${className}`}>{items.map(render)}</section>;
};
