import { Link } from 'react-router-dom';
import LogoImg from '../../assets/img/logo.png';

export const Logo = () => {
    return (
        <Link className="logo-container" to='/'>
            <img src={LogoImg} alt="logo" />
        </Link>
    );
};