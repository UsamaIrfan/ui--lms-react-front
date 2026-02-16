import { Ref } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableFooter,
  TableRow,
} from "@/components/ui/table";
import {
  ScrollerProps,
  TableComponents as TableComponentsType,
} from "react-virtuoso";

const VirtuosoTableComponents = {
  Scroller: function Scroller(
    props: ScrollerProps & { ref?: Ref<HTMLDivElement> }
  ) {
    return (
      <div
        className="overflow-auto rounded-md border bg-bg-white-0"
        {...props}
        ref={props.ref}
      />
    );
  },
  Table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <Table
      {...props}
      className="border-separate"
      style={{ ...props.style, borderCollapse: "separate" }}
    />
  ),
  TableHead: TableHead as unknown as TableComponentsType["TableHead"],
  TableFoot: TableFooter as unknown as TableComponentsType["TableFoot"],
  TableRow: TableRow,
  TableBody: function BodyTable(
    props: React.HTMLAttributes<HTMLTableSectionElement> & {
      ref?: Ref<HTMLTableSectionElement>;
    }
  ) {
    return <TableBody {...props} ref={props.ref} />;
  },
};

export default VirtuosoTableComponents;
