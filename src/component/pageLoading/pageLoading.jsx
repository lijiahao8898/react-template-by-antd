import React, {memo} from 'react';
import './pageLoading.scss';
import loadImage from '@/assets/image/loading-j.gif';

const PageLoading = (props) => {
    return (
        props.loading && <div className="jyc-loading">
            <div>
                <div>
                    <div>
                        <img alt="" className="loading-j" src={loadImage} />
                    </div>
                    <div>{props.children}</div>
                </div>
            </div>
        </div>
    )
};

export default memo(PageLoading);