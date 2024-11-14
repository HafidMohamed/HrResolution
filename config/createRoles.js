const Role = require('../models/Role');

const createRoles = async () => {
  try {
    const roles = [
        { name: 'Owner', permissions: ['company','admins','companies', 'departments', 'positions','schedules','shifts','users','basic' ], description: 'Full access to all features' },
        { name: 'Admin', permissions: ['companies', 'departments', 'positions','users','schedules','shifts','basic'], description: 'Manage users, companies, departments, positions' },
        { name: 'Customer_Company_Owner', permissions: ['company', 'departments', 'positions','users','schedules','shifts','basic'], description: 'Manage own company, departments, positions, users' },
        { name: 'Department_Manager', permissions: ['department', 'positions','users','schedules','shifts','basic'], description: 'Manage own department, positions, users' },
        { name: 'Shift_Manager', permissions: [ 'shifts','users','basic'], description: 'Manage shifts and employees in their department' },
        { name: 'User', permissions: ['basic'], description: 'Access own profile and basic features' },
    ];

    // Create and save roles
    for (let role of roles) {
        const updatedRole = await Role.findOneAndUpdate(
          { name: role.name }, // Find role by name
          role, // Update the role data
          { new: true, upsert: true } // Create the role if it doesn't exist
        );
  
        if (updatedRole) {
          console.log(`Role '${role.name}' processed.`);
        }
      }

    console.log('All roles processed.');
} catch (err) {
    console.error('Error creating roles:', err);
}
}; 

module.exports = createRoles;