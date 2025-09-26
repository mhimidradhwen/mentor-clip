import React, {ReactNode} from 'react';

function LayoutStudent({children}:{children:ReactNode}) {
    return (
        <div className="">
            {children}
        </div>
    );
}

export default LayoutStudent;