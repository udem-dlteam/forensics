import React from 'react';

const MetaWindow = function (props) {
  const { link, meta } = props;
  return (
    <div className="card rounded-0 bg-light w-100">
      <div className="card-header text-left">
        {meta.title}
      </div>
      <div className="card-body d-flex flex-row">
        <div className="flex-fill">
          <p>{meta.body[0]}</p>
          <p>{meta.body[1] && meta.body[1].replaceAll("\\n", "\n") }</p>
        </div>
        <div className="flex-fill w-50">
          {meta.body.slice(2).map(x => <p key={x}>{x}</p>)}
        </div>
      </div>
    </div>
  );
};

export default MetaWindow;
