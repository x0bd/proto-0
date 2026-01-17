const icons = require('@hugeicons/react');
console.log(Object.keys(icons).filter(k => 
  k.includes('Cancel') || 
  k.includes('Computer') || 
  k.includes('Monitor') || 
  k.includes('Edit') || 
  k.includes('Pencil') || 
  k.includes('Circle') || 
  k.includes('Maximize') || 
  k.includes('Minimize') || 
  k.includes('Delete') || 
  k.includes('Trash') || 
  k.includes('Send') || 
  k.includes('Sent') || 
  k.includes('Activity')
).join('\n'));
