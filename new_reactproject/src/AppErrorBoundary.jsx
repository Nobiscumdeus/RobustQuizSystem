import ErrorBoundary from "@components/ChasfatAcademy/errors/ErrorBoundary";
import PropTypes from "prop-types";


const AppErrorBoundary =({ children}) =>{
    return(
        <ErrorBoundary>
            { children }
        </ErrorBoundary>
    )
}

AppErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
};


export default AppErrorBoundary;

