
//utils
import classnames from 'helpers/css/class-list-to-string';


//The component
export default function IconStack({children, className, ...props}) {
    return <span className={classnames("fa-layers fa-fw", className)} {...props}>{children}</span>
}