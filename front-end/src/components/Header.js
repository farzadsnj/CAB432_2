import React, {useState, useEffect} from 'react';
import {NavLink, useNavigate} from 'react-router-dom';
import '../styles/header.css';
import {Container, Navbar, Nav} from 'react-bootstrap';
import {getToken, removeToken, getRole} from '../extensions/auth';

function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if token exists and update login state
        const token = getToken();
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        removeToken();  // Remove token from storage
        setIsLoggedIn(false);  // Update state
        navigate('/login');  // Redirect to login page
    };
    const isAdmin = getRole().includes('admin');

    return (
        <Navbar className="navbar" expand="lg">
            <Container>
                <Nav className="me-auto">
                    <Nav.Link as={NavLink} to="/">Home</Nav.Link>
                    <Nav.Link as={NavLink} to="/dashboard">Dashboard</Nav.Link>
                    {isAdmin && <Nav.Link as={NavLink} to="/userprofiles">User Profiles</Nav.Link>}
                </Nav>
                <Nav>
                    {isLoggedIn ? (
                        <>
                            <Nav.Link as={NavLink} to="/" onClick={handleLogout}>Logout</Nav.Link>
                        </>
                    ) : (
                        <>
                            <Nav.Link as={NavLink} to="/login">Login</Nav.Link>
                            <Nav.Link as={NavLink} to="/signup">Sign up</Nav.Link>
                        </>
                    )}
                </Nav>
            </Container>

        </Navbar>
    );
}


export default Header;