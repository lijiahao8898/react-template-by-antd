import React from 'react';
import {Carousel} from 'antd';
// style
import './loginCarousel.scss';

// 登录背景图组件
class LoginCarousel extends React.Component {
    constructor (props) {
        super(props);
        this.bgOne = React.createRef();
        this.bgTwo = React.createRef();
        this.bgThree = React.createRef();
        this.bgFour = React.createRef();
    }

    componentDidMount () {
        this.bgFour.current.style.height =
            this.bgThree.current.style.height =
                this.bgTwo.current.style.height =
                    this.bgOne.current.style.height = `${window.innerHeight}px`;
        this.bgFour.current.style.display =
            this.bgThree.current.style.display =
                this.bgTwo.current.style.display =
                    this.bgOne.current.style.display = `block`;
    }

    render () {
        return (
            <Carousel dots={false}
                      autoplay={true}
                      autoplaySpeed={15000}
                      speed={5000}
                      effect="fade">
                <div className="login-bg__item item-one" ref={this.bgOne} />
                <div className="login-bg__item item-two" ref={this.bgTwo} />
                <div className="login-bg__item item-three" ref={this.bgThree} />
                <div className="login-bg__item item-four" ref={this.bgFour} />
            </Carousel>
        )
    }
}

export default LoginCarousel
