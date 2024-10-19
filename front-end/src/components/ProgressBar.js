import React from 'react';

function ProgressBar({ progress }) {
    return (
        <div className="progress">
            <div
                className="progress-bar progress-bar-striped progress-bar-animated"
                role="progressbar"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}

export default ProgressBar;
