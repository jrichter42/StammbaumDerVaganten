using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StammbaumDerVaganten
{
    public enum CertaintyLevel
    {
        None,
        NoIdea,
        EstimationBad,
        EstimationMedium,
        EstimationGood,
        Confident,
        SetInStone
    }

    public class DataParticle
    {
        public CertaintyLevel Certainty;
    }

    //Objects without a history
    public class DataObject : DataParticle
    {
        
    }

    //Plain old data
    public class DataPiece<T> : DataParticle
    {
        protected DateTime Timestamp;
        protected List<DataPiece<T>> History = new List<DataPiece<T>>();

        protected T _value;
        public T Value
        {
            set
            {
                Timestamp = DateTime.Now;
                DataPiece<T> copy = this;
                History.Add(copy);
                _value = value;
            }
            get
            {
                return _value;
            }
        }

        public DataPiece()
        {
            Timestamp = DateTime.Now;
        }

        public DataPiece(T initValue) : this()
        {
            _value = initValue;
        }

        //Bypasses creation of history entry
        //I would love to overwrite the assignment operator so that I don't need this shit but its fucking impossible
        public void Init(T value)
        {
            Timestamp = DateTime.Now;
            _value = value;
        }
    }

    public class Date : DataPiece<DateTime>
    {
        public bool YearDefined = false;
        public bool MonthDefined = false;
        public bool DayDefined = false;
    }

    public class String : DataPiece<string>
    {
    }
}
