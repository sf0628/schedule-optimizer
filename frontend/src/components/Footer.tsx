import codeIcon from '../assets/icons/code.svg';

function Footer() {
    return (
        <p className='font-serif text-xs flex flex-row'>
        <img className="bject-scale-down w-4" src={codeIcon} alt="" />
         Developed by Sophia Fu and Veda Nandikam.
      </p>
    )
};

export default Footer;