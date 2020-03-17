import React from 'react';
import { Checkbox } from '@material-ui/core';
import { indexOf } from 'lodash';

export type BoardType = {
  name: string;
  desc: string;
  id: string;
  selected?: boolean;
};

interface BoardCheckboxProps {
  board: BoardType;
  selected: string[];
  handleSelect: (boardId: string) => void;
}

const BoardCheckbox: React.FunctionComponent<BoardCheckboxProps> = ({
  board,
  selected,
  handleSelect,
}) => {
  const { id, name, desc } = board;
  const handleChange = () => {
    handleSelect(id);
  };
  const checked = indexOf(selected, id) >= 0;
  return (
    <>
      <Checkbox onChange={handleChange} checked={checked} />
      <span>{`${name} ## ${desc}`}</span>
    </>
  );
};

export { BoardCheckbox };
