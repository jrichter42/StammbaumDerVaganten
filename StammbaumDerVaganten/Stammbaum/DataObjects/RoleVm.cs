using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StammbaumDerVaganten
{
    public class RoleVm : Viewmodel<Role>
    {
        public RoleType_Type Type
        {
            get { return model.Type.Value; }
            set
            {
                if (model.Type.Value != value)
                {
                    model.Type.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public string CustomType
        {
            get { return model.CustomType.Value; }
            set
            {
                if (model.CustomType.Value != value)
                {
                    model.CustomType.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public GroupType_Type GroupType
        {
            get { return model.GroupType.Value; }
            set
            {
                if (model.GroupType.Value != value)
                {
                    model.GroupType.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public string Comment
        {
            get { return model.Comment.Value; }
            set
            {
                if (model.Comment.Value != value)
                {
                    model.Comment.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public RoleVm(ref Role role) : base(ref role)
        {

        }
    }
}
