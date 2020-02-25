import React, { useEffect, useReducer } from 'react';
import {
  makeStyles,
  GridList,
  GridListTile,
  Checkbox,
} from '@material-ui/core';
import { useImmerReducer } from 'use-immer';

type BoardType = {
  name: string;
  desc: string;
  id: string;
};

type ActionType = {
  boards: BoardType[];
  type: string;
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    overflow: 'hidden',
    width: '80%',
    backgroundColor: theme.palette.background.default,
  },
  gridList: {
    width: '95%',
    height: '100%',
  },
  gridChild: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    color: 'black',
    fontSize: 14,
  },
}));

const boardsReducer = (boards: BoardType[] = [], action: ActionType) => {
  switch (action.type) {
    case 'FETCH_DONE': {
      // boards = action.boards || [];
      const boards = action.boards || [];
      return [...boards];
    }
    // return;
    case 'RESET': {
      return [];
    }
    default:
      return boards;
  }
};

const BoardsList = () => {
  const classes = useStyles();
  // const [boards, dispatch] = useImmerReducer(boardsReducer, []);
  const [boards, dispatch] = useReducer(boardsReducer, []);
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const { username } = await Trello.members.get('me');
        const boards = await Trello.members.get(`${username}/boards`, {
          filter: 'open',
          fields: 'id,name,desc',
        });

        dispatch({ type: 'FETCH_DONE', boards });
      } catch (e) {
        console.error(e);
        dispatch({ type: 'RESET', boards: [] });
      }
    };

    fetchBoards();
  }, []);
  return (
    <div className={classes.root}>
      <GridList cellHeight={60} className={classes.gridList} cols={2}>
        {boards.map(({ id, name, desc }) => (
          <GridListTile className={classes.gridChild} key={id} cols={1}>
            {
              <>
                <Checkbox />
                <span>{`${name} ## ${desc}`}</span>
              </>
            }
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
};

export { BoardsList };
