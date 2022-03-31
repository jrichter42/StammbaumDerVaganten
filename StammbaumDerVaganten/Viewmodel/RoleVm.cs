using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StammbaumDerVaganten
{
    public class RoleVm : ViewmodelOfReferenceable<Role>
    {
        public RoleType Type
        {
            get { return model.Type.Latest; }
            set
            {
                if (model.Type.Latest != value)
                {
                    model.Type.Latest = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public string CustomType
        {
            get { return model.CustomType.Latest; }
            set
            {
                if (model.CustomType.Latest != value)
                {
                    model.CustomType.Latest = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public GroupType GroupType
        {
            get { return model.GroupType.Latest; }
            set
            {
                if (model.GroupType.Latest != value)
                {
                    model.GroupType.Latest = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public string Comment
        {
            get { return model.Comment.Latest; }
            set
            {
                if (model.Comment.Latest != value)
                {
                    model.Comment.Latest = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public RoleVm()
        { }

        public RoleVm(Role role)
            : base(role)
        { }
    }
}
