import React from 'react';
import Carousel, {Modal, ModalGateway} from 'react-images';
import {Tooltip} from 'antd'
import {format} from '@/assets/js/common';

const Image = (props) => (
    <div
        style={{
            boxSizing: 'border-box',
            float: 'left',
            overflow: 'hidden',
            // paddingBottom: '100%',
            position: 'relative',
            width: '244px',
            height: '244px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            ':hover': {
                opacity: 0.9,
            },
        }}
        {...props}
    />
);

class ImagesPreview extends React.Component {
    state = {
        modalIsOpen: false,
        lightboxIsOpen: false,
        selectedIndex: 0,
    };
    toggleModal = () => {
        this.setState(state => ({modalIsOpen: !state.modalIsOpen}));
    };
    openModal = () => {
        this.setState(state => ({modalIsOpen: true}));
    };

    toggleLightbox = (selectedIndex) => {
        this.setState(state => ({
            lightboxIsOpen: !state.lightboxIsOpen,
            selectedIndex,
        }));
    };

    render () {
        const {lightboxIsOpen, selectedIndex} = this.state;
        const {RepaymentSchedsFiles} = this.props;
        const images = [];
        RepaymentSchedsFiles.forEach(item => {
            const obj = {};
            obj.source = item.enclosureUrl;
            obj.caption = item.enclosureName || '不知名文件';
            images.push(obj);
        });
        const customStyles = {
            header: (base, state) => ({
                ...base,
                color: state.isFullscreen ? 'red' : 'blue',
                padding: 10,
            }),
            view: (base) => ({
                ...base,
                // none of react-images styles are passed to <View />
                lineHeight: '0',
                position: 'relative',
                textAlign: 'center',
                boxSizing: 'border-box',
                height: 'calc(100vh - 54px)',
                WebkitBoxAlign: 'center',
                alignItems: 'center',
                WebkitBoxPack: 'center',
                justifyContent: 'center',
                display: 'flex',
            }),
            navigationPrev: () => ({
                color: 'rgb(107, 119, 140)',
                cursor: 'pointer',
                display: 'flex',
                fontSize: 'inherit',
                height: '50px',
                marginTop: '-25px',
                position: 'absolute',
                top: '50%',
                width: '50px',
                left: '20px',
                boxSizing: 'border-box',
                boxShadow: 'rgba(0, 0, 0, 0.18) 0px 1px 6px',
                WebkitBoxAlign: 'center',
                alignItems: 'center',
                WebkitBoxPack: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
                borderWidth: 0,
                borderRadius: '50%',
                outline: '0',
                transition: 'background-color 200ms ease 0s'
            }),
            navigationNext: () => ({
                color: 'rgb(107, 119, 140)',
                cursor: 'pointer',
                display: 'flex',
                fontSize: 'inherit',
                height: '50px',
                marginTop: '-25px',
                position: 'absolute',
                top: '50%',
                width: '50px',
                right: '20px',
                boxSizing: 'border-box',
                boxShadow: 'rgba(0, 0, 0, 0.18) 0px 1px 6px',
                WebkitBoxAlign: 'center',
                alignItems: 'center',
                WebkitBoxPack: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
                borderWidth: 0,
                borderRadius: '50%',
                outline: '0',
                transition: 'background-color 200ms ease 0s'
            }),
            footer: (base, state) => {
                const opacity = 1;
                const transition = 'opacity 300ms';

                return {...base, opacity, transition};
            },
            footerCaption: (base) => {
                return {
                    ...base
                }
            }
        };

        return (
            <div onClick={this.openModal} style={{
                overflow: 'hidden',
            }}>
                {RepaymentSchedsFiles.length > 0 && RepaymentSchedsFiles.map(({enclosureUrl, enclosureName, uploadUser, uploadTime}, index) => (
                    <div key={index} style={{
                        width: 'calc(33% - 4px)',
                        float: 'left',
                        position: 'relative',
                        background: '#fff',
                        margin: '2px',
                    }}>
                        <Image onClick={() => this.toggleLightbox(index)}>
                            <Tooltip placement="top" title="点击查看原图" arrowPointAtCenter={true}>
                                <div style={{
                                    width: '244px',
                                    height: '200px',
                                    position: 'absolute',
                                    zIndex: '999',
                                    top: '44px',
                                    cursor: 'pointer'
                                }}/>
                            </Tooltip>
                            <img
                                alt="点击查看原图"
                                src={enclosureUrl}
                                style={{
                                    cursor: 'pointer',
                                    position: 'absolute',
                                    maxWidth: '100%',
                                }}
                            />
                        </Image>
                        <div style={{
                            position: 'absolute',
                            textAlign: 'center',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.65)',
                            color: '#fff',
                            padding: '2px 0'
                        }}>
                            <div style={{
                                width: '200px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                textAlign: 'center',
                                margin: '0 auto'
                            }}>{enclosureName}</div>
                            <div>由{uploadUser}上传于{format(new Date(uploadTime), 'yyyy-MM-dd hh:mm:ss')}</div>
                        </div>
                    </div>
                ))}

                <ModalGateway>
                    {lightboxIsOpen && images.length > 0 ? (
                        <Modal onClose={() => this.toggleLightbox(selectedIndex)}
                               styles={{
                                   blanket: base => ({
                                       ...base,
                                       zIndex: 2048
                                   }),
                                   positioner: base => ({
                                       ...base,
                                       zIndex: 2049
                                   }),
                                   dialog: base => ({
                                       ...base,
                                   })
                               }}>
                            <Carousel
                                styles={customStyles}
                                currentIndex={selectedIndex}
                                frameProps={{autoSize: 'height'}}
                                views={images}
                            />
                        </Modal>
                    ) : null}
                </ModalGateway>
            </div>
        );
    }
}

export default ImagesPreview;
