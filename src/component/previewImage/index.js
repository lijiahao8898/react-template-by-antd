import React from 'react';
import Carousel, {Modal, ModalGateway} from 'react-images';
import {Icon} from 'antd';
import './index.scss';

const Image = (props) => (<div className='image-wrapper'{...props}/>);
const File = (props) => (<div className='file-wrapper'{...props}/>);
const fileType = ['jpg', 'gif', 'jpeg', 'bmp', 'png'];

class ImagesPreview extends React.Component {
    state = {
        modalIsOpen: false,
        lightboxIsOpen: false,
        selectedIndex: 0,
    };

    constructor (props) {
        super(props);
    }

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

    handleDelete = (index) => {
        this.props.delete(index);
    };

    render () {
        const {lightboxIsOpen, selectedIndex} = this.state;
        const {files} = this.props;
        const images = [];
        files.forEach(item => {
            const obj = {};
            obj.source = item.preview;
            obj.caption = item.name || '不知名文件';
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
                };
            }
        };

        return (
            <div onClick={this.openModal} style={{
                overflow: 'hidden',
            }}>
                {files.length > 0 && files.map((item, index) => {
                    let ImgContent = null;
                    if (item.preview.indexOf('image') !== -1 || fileType.includes(item.name.split('.')[1])) {
                        ImgContent = () => (
                            <div>
                                <Image>
                                    <img
                                        alt=""
                                        src={item.preview}
                                        style={{
                                            cursor: 'pointer',
                                            position: 'absolute',
                                            maxWidth: '100%',
                                        }}
                                    />
                                </Image>
                                <div className='preview-tool-wrapper'>
                                    <div className='preview-zoom' onClick={() => this.toggleLightbox(index)}>
                                        <Icon type="zoom-in"/>
                                    </div>
                                    <div className="preview-close" onClick={() => this.handleDelete(index)}>
                                        <Icon type="delete"/>
                                    </div>
                                </div>
                            </div>);
                    } else {
                        ImgContent = () => (
                            <div>
                                <File>
                                    <Icon type="file"/>
                                </File>
                                <div className='preview-tool-wrapper'>
                                    <div className="preview-close" onClick={() => this.handleDelete(index)}>
                                        <Icon type="delete"/>
                                    </div>
                                </div>
                            </div>);
                    }

                    return (
                        <div key={index} className='preview-img' style={{
                            width: '100px',
                            float: 'left',
                            position: 'relative',
                            background: '#fff',
                            margin: '2px',
                        }}>
                            <ImgContent/>
                            <div style={{
                                position: 'absolute',
                                textAlign: 'center',
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0,0,0,0.65)',
                                color: '#fff',
                                padding: '2px 0',
                                zIndex: '1024'
                            }}>
                                <div style={{
                                    width: '100px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    textAlign: 'center',
                                    margin: '0 auto',
                                    lineHeight: '15px',
                                    height: '15px'
                                }}>{item.name}</div>
                            </div>
                        </div>);
                })}

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
