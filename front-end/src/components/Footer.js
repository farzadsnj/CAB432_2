import React from 'react';
import {Container} from 'react-bootstrap';
import '../styles/footer.css';

function Footer() {
    return (
        <footer className="footer">
            <Container>
                <p className="text-center my-3">
                    © {new Date().getFullYear()} Video Transcoding Program. All rights reserved.
                </p>
                <p className="text-center my-1">
                    <a href="#">Privacy Policy</a>
                </p>
            </Container>
        </footer>
    );
}

export default Footer;
