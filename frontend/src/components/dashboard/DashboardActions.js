import React from 'react';
import { Link } from 'react-router-dom';

const DashboardActions = () => {
  return (
    <>
        <button>
            <Link to='/edit-profile'>
                Edit Profile 
            </Link>
        </button>
        <button>
            <Link to='/add-experience'>
                Add Experience 
            </Link>
        </button>
        <button>
            <Link to='/add-education'>
                Add Education 
            </Link>
        </button>
    </>
  );
};

export default DashboardActions;
